'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslation } from 'src/locales';

import { supabase } from '@/lib/supabase';

import { Form, Field } from 'src/components/hook-form';

import { FormHead } from 'src/auth/components/form-head';

// ----------------------------------------------------------------------

const createForgotPasswordSchema = (t: any) => zod.object({
  email: zod
    .string()
    .min(1, { message: t('validation.email.required') })
    .email({ message: t('validation.email.invalid') }),
});

type ForgotPasswordSchemaType = zod.infer<ReturnType<typeof createForgotPasswordSchema>>;

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ForgotPasswordSchemaType = {
    email: '',
  };

  const ForgotPasswordSchema = createForgotPasswordSchema(t);

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(t('resetPassword.success', { email: data.email }));
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage(t('resetPassword.errors.unexpected'));
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        autoFocus
        name="email"
        label={t('resetPassword.email')}
        placeholder="example@gmail.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('resetPassword.button')}
      >
        {t('resetPassword.button')}
      </Button>

      <Button
        fullWidth
        size="large"
        variant="outlined"
        onClick={() => router.push(paths.auth.supabase.signIn)}
        disabled={isSubmitting}
      >
        {t('resetPassword.backToLogin')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
      <Card sx={{ maxWidth: 420, width: '100%', p: 4, boxShadow: 3 }}>
        <FormHead
          title={t('resetPassword.title')}
          description={t('resetPassword.description')}
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