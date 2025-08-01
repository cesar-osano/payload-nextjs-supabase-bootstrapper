// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  // No guard needed - reset-password page handles its own authentication logic
  // Using GuestGuard would redirect users with recovery tokens to dashboard
  return <>{children}</>;
}