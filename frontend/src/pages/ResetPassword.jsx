import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { set, useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { showToast, toastMessages } from '../services/toastService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isTokenValid, setIsTokenValid] = useState(!!token);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      showToast.error(toastMessages.INVALID_RESET_TOKEN);
    } else{
      setIsTokenValid(true);
    }
  }, [token]);

  const onSubmit = async (data) => {
    try {
      await authAPI.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      showToast.success(toastMessages.PASSWORD_RESET_SUCCESS);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || toastMessages.PASSWORD_RESET_ERROR;
      showToast.error(message);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Token</h2>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired. Please request a new reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your new password to reset your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('newPassword', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Remember your password? <Link to="/login" className="text-blue-500 hover:underline font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}