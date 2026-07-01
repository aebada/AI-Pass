import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import DiscoverHomePage from '../../discover/page';

export default function WorkspaceDiscoverPage() {
  return (
    <WorkspaceLayoutClient title="Discover" subtitle="Personalized AI tool discovery">
      <DiscoverHomePage />
    </WorkspaceLayoutClient>
  );
}
