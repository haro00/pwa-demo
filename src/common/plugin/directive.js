/**
 * vue自定义指令 v-title
 */
export const title = {
    inserted(el, binding) {
        document.title = binding.value ? `document-${binding.value}` : 'document';
    }
};
