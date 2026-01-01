import { useNavigate } from "react-router-dom";

export default function AuthLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          System Wallah Digital Catalyst
        </h1>

        <p className="max-w-2xl text-lg text-gray-300 mb-10">
          A professional learning and digital growth platform designed for
          students, creators, and builders.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/system-wallah/login")}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/system-wallah/signup")}
            className="px-8 py-3 rounded-xl border border-white text-white font-semibold hover:bg-white hover:text-black transition"
          >
            Explore & Sign Up
          </button>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-semibold mb-3">What is Digital Catalyst?</h3>
          <p className="text-gray-400">
            A curated ecosystem for learning, tools, automation, and growth —
            built with real-world use cases.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">What You Get</h3>
          <p className="text-gray-400">
            Courses, dashboards, premium resources, and secure access to
            members-only content.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Why System Wallah</h3>
          <p className="text-gray-400">
            Built with clarity, depth, and long-term vision — not shortcuts.
          </p>
        </div>
      </section>

    </div>
  );
}
