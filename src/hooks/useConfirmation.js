import Swal from 'sweetalert2';

/**
 * Custom hook for SweetAlert2 confirmation dialogs
 * @returns {Object} object containing confirmAction function
 */
const useConfirmation = () => {

    /**
     * Shows a confirmation dialog
     * @param {Object} options - Configuration options
     * @param {string} options.title - Dialog title (default: "Are you sure?")
     * @param {string} options.text - Dialog text/message
     * @param {string} options.icon - Dialog icon (default: "warning")
     * @param {string} options.confirmButtonText - Confirm button text (default: "Yes, delete it!")
     * @param {string} options.cancelButtonText - Cancel button text (default: "Cancel")
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
     */
    const confirmAction = async ({
        title = "Are you sure?",
        text = "You won't be able to revert this!",
        icon = "warning",
        confirmButtonText = "Yes, delete it!",
        cancelButtonText = "Cancel"
    } = {}) => {
        // Resolve theme colors at runtime
        const rootStyle = getComputedStyle(document.documentElement);
        const primaryColor = rootStyle.getPropertyValue('--brand-primary').trim() || '#4f46e5';
        const errorColor = rootStyle.getPropertyValue('--brand-error').trim() || '#ef4444';
        const secondaryTextColor = rootStyle.getPropertyValue('--brand-text-secondary').trim() || '#475569';

        // Select best confirm color based on intent
        const confirmButtonColor = icon === 'warning' ? errorColor : primaryColor;
        const cancelButtonColor = secondaryTextColor;

        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,

            customClass: {
                popup: `
                    rounded-2xl border 
                    bg-brand-surface 
                    border-brand-border 
                    shadow-lg
                `,

                title: 'text-brand-text font-semibold',

                htmlContainer: 'text-brand-text-secondary text-sm',

                actions: 'gap-3 mt-4',

                confirmButton: `
                    rounded-xl px-6 py-2.5 font-semibold
                    bg-brand-primary text-white
                    hover:bg-brand-primary-hover
                    focus:outline-none
                    `,

                cancelButton: `
                    rounded-xl px-6 py-2.5 font-semibold
                    border border-brand-border
                    text-brand-text-secondary
                    hover:bg-brand-surface-hover`
            },

            buttonsStyling: false
        });

        return result.isConfirmed;
    };

    return { confirmAction };
};

export default useConfirmation;
