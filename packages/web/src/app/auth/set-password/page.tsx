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

const createSetPasswordSchema = (t: any) => zod
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

type SetPasswordSchemaType = zod.infer<ReturnType<typeof createSetPasswordSchema>>;

// ----------------------------------------------------------------------

export default function SetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const showPassword = useBoolean();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isValidInviteLink, setIsValidInviteLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [inviteTokens, setInviteTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);

  const defaultValues: SetPasswordSchemaType = {
    password: '',
    confirmPassword: '',
  };

  const SetPasswordSchema = createSetPasswordSchema(t);

  const methods = useForm<SetPasswordSchemaType>({
    resolver: zodResolver(SetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Check if user has valid invitation tokens from the URL
  useEffect(() => {
    const checkInviteLink = async () => {
      try {
        // Check for hash params (from invitation link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && type === 'invite') {
          // Store tokens for password setup
          setInviteTokens({ access_token: accessToken, refresh_token: refreshToken });
          setIsValidInviteLink(true);
          setIsCheckingLink(false);
          
          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
        
        // If no valid invite tokens, this is not a valid invitation link
        setErrorMessage(t('setPassword.errors.invalidLink'));
        setIsCheckingLink(false);
      } catch (error) {
        console.error('Invite link check error:', error);
        setErrorMessage(t('setPassword.errors.unexpected'));
        setIsCheckingLink(false);
      }
    };

    checkInviteLink();
  }, [t]);

  const onSubmit = handleSubmit(async (data) => {
    if (!inviteTokens) {
      setErrorMessage(t('setPassword.errors.noLink'));
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // First, set the session using the invite tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: inviteTokens.access_token,
        refresh_token: inviteTokens.refresh_token,
      });

      if (sessionError) {
        setErrorMessage(t('setPassword.errors.invalidLink'));
        return;
      }

      // Now update the password for the invited user
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setErrorMessage(updateError.message);
        return;
      }

      if (updateData?.user) {
        setSuccessMessage(t('setPassword.success'));
        
        // Redirect to dashboard after successful password setup
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Set password error:', error);
      setErrorMessage(t('setPassword.errors.unexpected'));
    }
  });

  if (isCheckingLink) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3, textAlign: 'center' }}>
          <div>{t('setPassword.loading.verifying')}</div>
        </Card>
      </Box>
    );
  }

  if (!isValidInviteLink) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3 }}>
          <FormHead
            title={t('setPassword.invalidLink.title')}
            description={t('setPassword.invalidLink.description')}
            sx={{ textAlign: 'left', mb: 4 }}
          />
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage || t('setPassword.invalidLink.error')}
          </Alert>
          <Button
            variant="text"
            onClick={() => router.push('/auth/login')}
            sx={{ display: 'block', mx: 'auto' }}
          >
            {t('setPassword.invalidLink.button')}
          </Button>
        </Card>
      </Box>
    );
  }

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="password"
        label={t('setPassword.newPassword')}
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
        label={t('setPassword.confirmPassword')}
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
        loadingIndicator={t('setPassword.loading.setting')}
      >
        {t('setPassword.button')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
      <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3 }}>
        <FormHead
          title={t('setPassword.title')}
          description={t('setPassword.description')}
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