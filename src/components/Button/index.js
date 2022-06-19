import {withMergedClassName} from 'util/react';

const TailwindUiPrimary = props => (
  <button
    type='button'
    className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
    {...props}
  />
);

const CLASS_NAME = 'inline-flex items-center justify-center border border-transparent loading-none font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'

const Button = withMergedClassName(`${CLASS_NAME} px-2 py-2 text-base`, TailwindUiPrimary);

Button.Sm = withMergedClassName(`${CLASS_NAME} px-2 py-2 text-sm`, TailwindUiPrimary);
Button.Xs = withMergedClassName(`${CLASS_NAME} px-3 py-2 text-sm`, TailwindUiPrimary);
Button.Xxs = withMergedClassName(`${CLASS_NAME} px-2.5 py-1.5 text-xs`, TailwindUiPrimary);

export default Button;