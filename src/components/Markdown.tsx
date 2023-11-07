/**
 * @file WYSIWYG markdown editor
 */

import {Schema} from "hast-util-sanitize";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import styles from "~/components/Markdown.module.css";

/**
 * Sanitization schema
 * @see https://github.com/syntax-tree/hast-util-sanitize#schema
 */
const schema = {
  allowComments: false,
  allowDoctypes: false,
  ancestors: {},
  attributes: {},
  strip: ["script"],
  tagNames: [
    "b",
    "blockquote",
    "br",
    "code",
    "del",
    "details",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "ins",
    "kbd",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "ul",
  ],
} as Schema;

/**
 * Props for WYSIWYG markdown editor
 */
interface MarkdownProps {
  /**
   * Raw Github-Flavored Markdown (GFM) content
   */
  raw: string;
}

/**
 * WYSIWYG markdown editor component
 * @returns JSX
 */
export const Markdown: React.FC<MarkdownProps> = ({raw}) => (
  <div className={styles.container}>
    <ReactMarkdown
      className={styles.markdown}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, schema]]}
    >
      {raw}
    </ReactMarkdown>
  </div>
);
