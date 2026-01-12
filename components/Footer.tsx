
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-600 font-medium">
          "প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"
        </p>
        <p className="text-slate-400 text-xs mt-2">
          &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
