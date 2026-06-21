/**
 * Every page lives on a cube face keyed by `path`. CubeWrapper reads this prop
 * to place the page; the page component itself usually doesn't need it.
 */
export interface PageProps {
  path: string;
}
