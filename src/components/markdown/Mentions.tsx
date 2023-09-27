/**
 * @file Mentions menu
 */

import {SlashProvider} from "@milkdown/plugin-slash";
import {useEffect, useRef} from "react";

/**
 * Mentions menu component
 * @returns JSX
 */
const Mentions: React.FC = () => {
  // Hooks
  const ref = useRef<HTMLDivElement>(null);
  const provider = useRef<SlashProvider>();

  // Effects
  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    // Initialize the provider
    provider.current = new SlashProvider({
      content: ref.current,
      debounce: 50,
      trigger: "@",
    });
  });

  return (
    <div role="tooltip" ref={ref}>
      <h1>Hello, world!</h1>
    </div>
  );
};

export default Mentions;
