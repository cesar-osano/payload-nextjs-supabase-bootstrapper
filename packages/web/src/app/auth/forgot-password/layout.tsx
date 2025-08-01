// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  // No guard needed - set-password page handles its own validation
  return <>{children}</>;
}