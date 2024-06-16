/* eslint-disable camelcase */
/**
 * @file Database security tests
 */

import {beforeAll, describe, expect, test} from "vitest";

import {reset} from "#/supabase/supabase";
import {client} from "~/lib/supabase";

describe(
  "database security",
  {
    sequential: true,
  },
  () => {
    beforeAll(
      async () => {
        // Reset Supabase
        await reset();
      },
      1000 * 60 * 5,
    );

    describe("unauthenticated user", () => {
      test.each([
        [
          "utilities",
          "safe_random",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "get_random_color",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "get_random_emoji",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "prune_expired_locations",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "prune_locations_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "setup_profile_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "validate_location_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "anonymize_location_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "post_deleted_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "post_view_modified_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "post_vote_modified_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "comment_modified_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "comment_view_modified_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "utilities",
          "comment_vote_modified_trigger",
          {},
          "The schema must be one of the following: public, storage, graphql_public",
        ],
        [
          "public",
          "validate_post_access",
          {
            _post_id: "'00000000-0000-0000-0000-000000000000'::UUID",
          },
          "permission denied for function validate_post_access",
        ],
        [
          "public",
          "validate_media_object_name",
          {
            _object_name: "",
          },
          "permission denied for function validate_media_object_name",
        ],
        [
          "public",
          "delete_account",
          {},
          "permission denied for function delete_account",
        ],
        [
          "public",
          "distance_to",
          {
            _other_location: "'POINT(0 0)'::extensions.GEOMETRY",
          },
          "permission denied for schema extensions",
        ],
        [
          "public",
          "get_latest_location",
          {},
          "permission denied for function get_latest_location",
        ],
        [
          "public",
          "calculate_rank",
          {
            _distance: 0,
            _score: 0,
            _created_at: "'1970-01-01T00:00:00Z'::TIMESTAMPTZ",
          },
          "permission denied for function calculate_rank",
        ],
      ])("can't call routine %s.%s", async (schema, fn, args, message) => {
        await expect(
          client.schema(schema as any).rpc(fn as any, args),
        ).resolves.toHaveProperty("error.message", message);
      });

      test.each([
        [
          "public",
          "profiles",
          "permission denied for table profiles",
        ],
        [
          "public",
          "locations",
          "permission denied for table locations",
        ],
        [
          "public",
          "posts",
          "permission denied for table posts",
        ],
        [
          "public",
          "personalized_posts",
          "permission denied for view personalized_posts",
        ],
        [
          "public",
          "post_views",
          "permission denied for table post_views",
        ],
        [
          "public",
          "post_votes",
          "permission denied for table post_votes",
        ],
        [
          "public",
          "post_reports",
          "permission denied for table post_reports",
        ],
        [
          "public",
          "comments",
          "permission denied for table comments",
        ],
        [
          "public",
          "personalized_comments",
          "permission denied for view personalized_comments",
        ],
        [
          "public",
          "comment_views",
          "permission denied for table comment_views",
        ],
        [
          "public",
          "comment_votes",
          "permission denied for table comment_votes",
        ],
        [
          "public",
          "comment_reports",
          "permission denied for table comment_reports",
        ],
      ])("can't select relation %s.%s", async (schema, relation, message) => {
        await expect(
          client
            .schema(schema as any)
            .from(relation as any)
            .select("*"),
        ).resolves.toHaveProperty("error.message", message);
      });
    });
  },
);
