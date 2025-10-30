/*
  # Add Arabic translations to remaining static pages
  
  1. Updates
    - Adds Arabic (ar) translations to help, privacy-policy, terms-of-service, and cookie-policy pages
    - Includes title, content, and meta description translations
  
  2. Notes
    - This migration adds Arabic language support to complete the multilingual static pages
    - Uses simplified Arabic translations for these legal and help pages
*/

-- Update Help Center page
UPDATE static_pages 
SET 
  content_translations = content_translations || jsonb_build_object(
    'ar', 'مركز المساعدة

مرحباً بك في مركز المساعدة. نحن هنا لمساعدتك.

البدء: انقر على "تسجيل" لإنشاء حساب.
البحث: استخدم شريط البحث للعثور على المحتوى.
الدعم: اتصل بنا إذا كنت بحاجة إلى مساعدة.'
  ),
  meta_description_translations = meta_description_translations || jsonb_build_object(
    'ar', 'مركز مساعدة TVShowUp'
  )
WHERE slug = 'help';

-- Update Privacy Policy page
UPDATE static_pages 
SET 
  content_translations = content_translations || jsonb_build_object(
    'ar', 'سياسة الخصوصية

آخر تحديث: 24 أكتوبر 2025

نلتزم بحماية خصوصيتك. نجمع معلومات الحساب والتفاعلات لتقديم خدماتنا.

لديك حقوق الوصول والتصحيح والحذف لمعلوماتك.

اتصل بنا: privacy@tvshowup.com'
  ),
  meta_description_translations = meta_description_translations || jsonb_build_object(
    'ar', 'سياسة خصوصية TVShowUp'
  )
WHERE slug = 'privacy-policy';

-- Update Terms of Service page
UPDATE static_pages 
SET 
  content_translations = content_translations || jsonb_build_object(
    'ar', 'شروط الخدمة

آخر تحديث: 24 أكتوبر 2025

مرحباً بك في TVShowUp. باستخدام خدماتنا، توافق على هذه الشروط.

نوفر منصة لاكتشاف معلومات البث. أنت مسؤول عن أمان حسابك.

اتصل بنا: legal@tvshowup.com'
  ),
  meta_description_translations = meta_description_translations || jsonb_build_object(
    'ar', 'شروط خدمة TVShowUp'
  )
WHERE slug = 'terms-of-service';

-- Update Cookie Policy page
UPDATE static_pages 
SET 
  content_translations = content_translations || jsonb_build_object(
    'ar', 'سياسة ملفات تعريف الارتباط

آخر تحديث: 24 أكتوبر 2025

نستخدم ملفات تعريف الارتباط لتحسين تجربتك.

ملفات تعريف الارتباط الأساسية: للمصادقة والأمان
ملفات التفضيلات: لحفظ اختياراتك
ملفات التحليلات: لفهم الاستخدام

اتصل بنا: privacy@tvshowup.com'
  ),
  meta_description_translations = meta_description_translations || jsonb_build_object(
    'ar', 'سياسة ملفات تعريف الارتباط'
  )
WHERE slug = 'cookie-policy';
