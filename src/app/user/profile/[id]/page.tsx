import UserProfilePage from "../UserProfilePage";

export default function Page({ params }: { params: { id: string } }) {
  return <UserProfilePage id={params.id} />;
}
