/**
 * Usado para os metodos:
 * * GET
 * * POST
 */
function contents() {
  return `/contents`;
}

/**
 * Usado para os metodos:
 * * GET
 * * POST
 */
function session() {
  return `/sessions`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function user() {
  return `/user`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function users(username = null) {
  return `/users${username ? "/" + username : ""}`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function status() {
  return `/status`;
}

/**
 * Usado para os metodos:
 */
function analytics() {
  return `/analytics`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function allContents(strategy = "new", page = 1) {
  return `${contents()}?strategy=${strategy}&page=${page}`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function allUserContents(username, strategy = "new", page = 1) {
  return `${contents()}/${username}?strategy=${strategy}&page=${page}`;
}

/**
 * Usado para os metodos:
 * * GET
 * * PATCH
 */
function content(username, slug) {
  return `${contents()}/${username}/${slug}`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function contentThumbnail(username, slug) {
  return `${content(username, slug)}/thumbnail`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function contentParent(username, slug) {
  return `${content(username, slug)}/parent`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function contentChildren(username, slug) {
  return `${content(username, slug)}/children`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function childContentCreatedAnalytics() {
  return `${analytics()}/child-content-published`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function rootContentCreatedAnalytics() {
  return `${analytics()}/root-content-published`;
}

/**
 * Usado para os metodos:
 * * GET
 */
function usersCreatedAnalytics() {
  return `${analytics()}/users-created`;
}

export default {
  contents,
  session,
  user,
  users,
  status,
  analytics,
  allContents,
  allUserContents,
  content,
  childContentCreatedAnalytics,
  rootContentCreatedAnalytics,
  usersCreatedAnalytics,
  contentParent,
  contentChildren,
  contentThumbnail,
};
