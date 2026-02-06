import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  custom: (message) => toast(message),
};


export const toastMessages = {

  LOGIN_SUCCESS: 'Giriş başarılı!',
  LOGIN_ERROR: 'Giriş başarısız',
  REGISTER_SUCCESS: 'Kayıt başarılı! Lütfen giriş yapın.',
  REGISTER_ERROR: 'Kayıt başarısız',
  LOGOUT_SUCCESS: 'Çıkış başarılı!',
  
  PASSWORD_RESET_SENT: 'Parola sıfırlama linki emailinize gönderildi!',
  PASSWORD_RESET_ERROR: 'Parola sıfırlama başarısız',
  PASSWORD_RESET_SUCCESS: 'Parolanız başarıyla sıfırlandı!',
  INVALID_RESET_TOKEN: 'Geçersiz veya süresi geçmiş token',
  
  INVALID_EMAIL: 'Geçerli bir email girin',
  PASSWORDS_NOT_MATCH: 'Parolalar eşleşmiyor',
  PASSWORD_TOO_SHORT: 'Parola en az 6 karakter olmalı',
  
  TASK_ADDED: 'Task başarıyla eklendi',
  TASK_UPDATED: 'Task başarıyla güncellendi',
  TASK_DELETED: 'Task başarıyla silindi',
  TASK_ADD_ERROR: 'Task eklenemedi',
  TASK_UPDATE_ERROR: 'Task güncellenemedi',
  TASK_DELETE_ERROR: 'Task silinemedi',
  
  TITLE_REQUIRED: 'Başlık gereklidir',
  DESCRIPTION_REQUIRED: 'Açıklama gereklidir',
  USER_REQUIRED: 'Kullanıcı seçmelisiniz',
  
  SERVER_ERROR: 'Sunucu hatası oluştu',
  REQUIRED_FIELDS: 'Tüm alanlar gereklidir',
};

export default showToast;