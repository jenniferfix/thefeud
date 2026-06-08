import LoginForm from "@/components/login/LoginForm";

export default function Login({ redirect }: { redirect?: string }) {
  return (
    <div className="relative px-4">
      <LoginForm redirect={redirect} />
    </div>
  );
}
