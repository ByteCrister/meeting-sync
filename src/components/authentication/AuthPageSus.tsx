import WithSuspense from "../global-ui/WithSuspense";
import AuthErrorPage from "./AuthErrorPage";

export default function Page() {
  return (
    <WithSuspense>
      <AuthErrorPage />
    </WithSuspense>
  );
}
