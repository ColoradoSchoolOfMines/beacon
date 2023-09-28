/**
 * @file Mentions menu
 */

import {Ctx} from "@milkdown/ctx";
import {slashFactory, SlashProvider} from "@milkdown/plugin-slash";
import {useInstance} from "@milkdown/react";
import {usePluginViewContext} from "@prosemirror-adapter/react";
import {useCallback, useEffect, useRef} from "react";

/**
 * Slash mentions menu factory
 */
export const slashMentions = slashFactory("mentions");

/**
 * Mentions menu component
 * @returns JSX
 */
export const Mentions: React.FC = () => {
  // Hooks
  const ref = useRef<HTMLDivElement>(null);
  const provider = useRef<SlashProvider>();

  const {view, prevState} = usePluginViewContext();
  const [loading, get] = useInstance();

  // const action = useCallback(
  //   (fn: (ctx: Ctx) => void) => {
  //     if (loading) {
  //       return;
  //     }

  //     get().action(fn);
  //   },
  //   [loading]
  // );

  // Effects
  useEffect(() => {
    if (loading || ref.current === null) {
      return;
    }

    // Set the provider
    provider.current = new SlashProvider({
      content: ref.current,
      debounce: 50,
      trigger: "@",
      tippyOptions: {
        placement: "bottom",
      },
    });

    return () => provider.current?.destroy();
  });

  useEffect(() => provider.current?.update(view, prevState));

  return (
    <div aria-expanded="false">
      <div className="" role="tooltip" ref={ref}>
        <h1>Hello, world!</h1>
      </div>
    </div>
  );
};
