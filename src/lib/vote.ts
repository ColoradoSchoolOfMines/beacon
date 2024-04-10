/**
 * @file Vote utility
 */

import {PostgrestError} from "@supabase/supabase-js";
import {cloneDeep} from "lodash-es";

import {Database} from "~/lib/schema";
import {client} from "~/lib/supabase";
import {KeysOfType, VotableEntity} from "~/lib/types";

/**
 * Toggle a vote on an entity
 * @param entity Entity to toggle the vote on
 * @param setEntity Setter for the entity
 * @param upvote Whether the vote is an upvote or a downvote
 * @param table Table to toggle the vote on
 * @param entityIDColumn Identifier column the of the entity the vote is for
 */
export const toggleVote = async <
  T extends VotableEntity,
  U extends KeysOfType<
    Database["public"]["Tables"],
    {
      Row: {
        id: string;
        upvote: boolean;
      };
    }
  >,
>(
  entity: T,
  setEntity: (entity: T) => void,
  upvote: boolean,
  table: U,
  entityIDColumn: keyof Database["public"]["Tables"][U]["Row"],
) => {
  const oldEntity = cloneDeep(entity);
  // eslint-disable-next-line unicorn/no-null
  let error: PostgrestError | null = null;

  // Upsert the upvote
  if (entity.upvote !== true && upvote) {
    // Optimistically update the entity
    setEntity({
      ...entity,
      upvotes: entity.upvotes + 1,
      downvotes:
        entity.upvote === false ? entity.downvotes - 1 : entity.downvotes,
      upvote: true,
    });

    // Upsert the vote
    ({error} = await client.from(table).upsert(
      {
        [entityIDColumn]: entity.id,
        upvote: true,
      } as any,
      {
        onConflict: `${entityIDColumn as string}, voter_id`,
      },
    ));
  }
  // Upsert the downvote
  else if (entity.upvote !== false && !upvote) {
    // Optimistically update the entity
    setEntity({
      ...entity,
      upvotes: entity.upvote === true ? entity.upvotes - 1 : entity.upvotes,
      downvotes: entity.downvotes + 1,
      upvote: false,
    });

    // Upsert the vote
    ({error} = await client.from(table).upsert(
      {
        [entityIDColumn]: entity.id,
        upvote: false,
      } as any,
      {
        onConflict: `${entityIDColumn as string}, voter_id`,
      },
    ));
  }
  // Delete the vote
  else {
    // Optimistically update the entity
    setEntity({
      ...entity,
      upvotes: entity.upvote === true ? entity.upvotes - 1 : entity.upvotes,
      downvotes:
        entity.upvote === false ? entity.downvotes - 1 : entity.downvotes,
      // eslint-disable-next-line unicorn/no-null
      upvote: null,
    });

    // Delete the vote
    ({error} = await client
      .from(table)
      .delete()
      .eq(entityIDColumn as string, entity.id));
  }

  // Handle error
  if (error !== null) {
    // Restore the old entity
    setEntity(oldEntity);

    return;
  }
};
