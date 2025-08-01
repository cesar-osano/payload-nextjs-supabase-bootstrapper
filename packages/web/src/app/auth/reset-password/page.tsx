'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useTranslation } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { supabase } from '@/lib/supabase';

import { Form, Field } from 'src/components/hook-form';

import { FormHead } from 'src/auth/components/form-head';

// ----------------------------------------------------------------------

const createResetPasswordSchema = (t: any) => zod
  .object({
    password: zod
      .string()
      .min(1, { message: t('validation.password.required') })
      .min(6, { message: t('validation.password.minLength') }),
    confirmPassword: zod.string().min(1, { message: t('validation.confirmPassword.required') }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('validation.confirmPassword.noMatch'),
    path: ['confirmPassword'],
  });

type ResetPasswordSchemaType = zod.infer<ReturnType<typeof createResetPasswordSchema>>;

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const showPassword = useBoolean();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [resetTokens, setResetTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);

  const defaultValues: ResetPasswordSchemaType = {
    password: '',
    confirmPassword: '',
  };

  const ResetPasswordSchema = createResetPasswordSchema(t);

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Check if user has valid reset tokens from the URL
  useEffect(() => {
    const checkResetLink = async () => {
      try {
        // Check for hash params (from reset password link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && type === 'recovery') {
          // Store tokens for password update
          setResetTokens({ access_token: accessToken, refresh_token: refreshToken });
          setIsValidResetLink(true);
          setIsCheckingLink(false);
          
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
        
        // If no valid reset tokens, this is not a valid reset link
        setErrorMessage(t('updatePassword.errors.invalidLink'));
        setIsCheckingLink(false);
      } catch (error) {
        console.error('Reset link check error:', error);
        setErrorMessage(t('updatePassword.errors.unexpected'));
        setIsCheckingLink(false);
      }
    };

    checkResetLink();
  }, [t]);

  const onSubmit = handleSubmit(async (data) => {
    if (!resetTokens) {
      setErrorMessage(t('updatePassword.errors.noLink'));
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // First, set the session using the reset tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: resetTokens.access_token,
        refresh_token: resetTokens.refresh_token,
      });

      if (sessionError) {
        setErrorMessage(t('updatePassword.errors.invalidLink'));
        return;
      }

      // Now update the password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setErrorMessage(updateError.message);
        return;
      }

      if (updateData?.user) {
        setSuccessMessage(t('updatePassword.success'));
        
        // Sign out the user so they can sign in with the new password
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Update password error:', error);
      setErrorMessage(t('updatePassword.errors.unexpected'));
    }
  });

  if (isCheckingLink) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3, textAlign: 'center' }}>
          <div>{t('updatePassword.loading.verifying')}</div>
        </Card>
      </Box>
    );
  }

  if (!isValidResetLink) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3 }}>
          <FormHead
            title={t('updatePassword.invalidLink.title')}
            description={t('updatePassword.invalidLink.description')}
            sx={{ textAlign: 'left', mb: 4 }}
          />
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage || t('updatePassword.invalidLink.error')}
          </Alert>
          <Button
            variant="text"
            onClick={() => router.push('/auth/login')}
            sx={{ display: 'block', mx: 'auto' }}
          >
            {t('updatePassword.invalidLink.button')}
          </Button>
        </Card>
      </Box>
    );
  }

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="password"
        label={t('updatePassword.newPassword')}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text
        name="confirmPassword"
        label={t('updatePassword.confirmPassword')}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        type="submit"
        size="large"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('updatePassword.loading.updating')}
      >
        {t('updatePassword.button')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
      <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3 }}>
        <FormHead
          title={t('updatePassword.title')}
          description={t('updatePassword.description')}
          sx={{ textAlign: 'left', mb: 4 }}
        />

        {!!successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {!!errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Card>
    </Box>
  );
}