/**
 * @file Markdown renderer component
 */

import {Schema} from "hast-util-sanitize";
import {FC} from "react";
import ReactMarkdown, {Options} from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import styles from "~/components/markdown.module.css";

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
    "table",
    "td",
    "th",
    "u",
    "tr",
    "ul",
  ],
} as Schema;

/**
 * Markdown renderer component props
 */
interface MarkdownProps extends Options {
  /**
   * Raw Github-Flavored Markdown (GFM) content
   */
  raw: string;
}

/**
 * Markdown renderer component
 * @returns JSX
 */
export const Markdown: FC<MarkdownProps> = ({raw, ...props}) => (
  <ReactMarkdown
    {...props}
    className={`${styles.markdown} ${props.className ?? ""}`}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[[rehypeRaw], [rehypeSanitize, schema]]}
  >
    {raw}
  </ReactMarkdown>
);
