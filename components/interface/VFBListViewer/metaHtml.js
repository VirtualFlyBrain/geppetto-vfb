/**
 * Read the HTML string held by a variable (e.g. "type", "label") of a
 * <id>_meta instance. Returns undefined when the variable is absent: an image
 * with no instance_of class in the KB has no "type" variable at all
 * (VFB2#499), and must not crash the layer list.
 */
export function getMetaHtml (metaInstance, variableName) {
  const metaType = metaInstance?.getTypes?.()?.[0];
  const variable = metaType?.[variableName];
  return variable?.getInitialValue?.()?.value?.html;
}
