'use client';

import QuestionList from './QuestionList';

export default function QuestionPage() {
  return (
    <main className="">
         <div className="relative overflow-hidden">
            <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "400px", left: "-420px" }} />
            <div className="absolute w-[500] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "770px", left: "1470px" }} />
            <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "1350px", left: "-300px" }} />
            <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "2050px", left: "1470px" }} />
            <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "2980px", left: "-150px" }} />
            <div className="absolute w-[500px] h-[550px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "4750px", left: "1470px" }} />
        <QuestionList />
      </div>
    </main>
  );
}
