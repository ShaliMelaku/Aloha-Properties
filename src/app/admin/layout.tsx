export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Integrate Supabase Server-Side Auth here.
  // When deploying, you would uncomment the following:
  // const supabase = createServerComponentClient({ cookies })
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) {
  //   redirect('/login');
  // }

  return <>{children}</>;
}
