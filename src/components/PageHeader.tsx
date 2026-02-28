import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

const PageHeader = ({ title, showBack = true }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="header-gradient px-4 py-4 flex items-center gap-3">
      {showBack && (
        <button onClick={() => navigate(-1)} className="text-primary-foreground/90 hover:text-primary-foreground">
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="text-lg font-semibold text-primary-foreground">{title}</h1>
    </header>
  );
};

export default PageHeader;
