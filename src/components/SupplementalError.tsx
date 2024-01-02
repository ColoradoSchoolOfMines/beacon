/**
 * @file Supplemental error component (e.g.: for when a form field doesn't have native support for showing errors)
 */

/**
 * Supplemental error component props
 */
interface SupplementalErrorProps {
  /**
   * Error message
   */
  error?: string;
}

/**
 * Supplemental error component (e.g.: for when a form field doesn't have native support for showing errors)
 * @returns JSX
 */
export const SupplementalError: React.FC<SupplementalErrorProps> = ({error}) =>
  error !== undefined && (
    <div className="border-[var(--ion-color-danger)] border-solid border-t-1 w-full z-10">
      <p className="!text-[12px] pt-1.25 text-[var(--ion-color-danger)]">
        {error}
      </p>
    </div>
  );
