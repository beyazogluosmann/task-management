import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { showToast, toastMessages } from '../services/toastService';

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data.name, data.email, data.password);
      if (result.success) {
        showToast.success(toastMessages.REGISTER_SUCCESS);
        navigate('/login', { replace: true });
      } else {
        showToast.error(result.error || toastMessages.REGISTER_ERROR);
      }
    } catch (error) {
      showToast.error(toastMessages.SERVER_ERROR);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Ad Soyad</label>
            <input
              type="text"
              placeholder="Adınız soyadınız"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('name', {
                required: 'Ad soyad gereklidir',
                minLength: {
                  value: 3,
                  message: 'Ad soyad en az 3 karakter olmalı'
                }
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              placeholder="Email adresiniz"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('email', {
                required: 'Email gereklidir',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Geçerli bir email girin'
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Şifre</label>
            <input
              type="password"
              placeholder="Şifreniz"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('password', {
                required: 'Şifre gereklidir',
                minLength: {
                  value: 6,
                  message: 'Şifre en az 6 karakter olmalı'
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Şifre Onayla</label>
            <input
              type="password"
              placeholder="Şifrenizi tekrar girin"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              {...register('confirmPassword', {
                required: 'Şifre onayı gereklidir',
                validate: (value) => value === password || 'Şifreler eşleşmiyor'
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
            {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Hesabın var mı? <Link to="/login" className="text-blue-500 hover:underline font-semibold">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
