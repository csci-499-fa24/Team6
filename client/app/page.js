import Link from 'next/link';

const LandingPage = () => {
  return (
    <div>
      <h1>Landing Page</h1>
      <nav>
        <Link href="/home">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/pantry">Pantry</Link>
        <Link href="/recipe">Recipe</Link>
        <Link href="/register">Register</Link>
      </nav>
    </div>
  );
};

export default LandingPage;