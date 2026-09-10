import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from './react-swagger';

export const metadata = {
  title: 'API Documentation',
  description: 'Swagger API documentation',
};

export default async function ApiDocsPage() {
  const spec = await getApiDocs();

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactSwagger spec={spec} />
    </div>
  );
}
