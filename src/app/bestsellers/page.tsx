import EditPage, { editMetadata } from "@/components/commerce/EditPage";
import type { RawParams } from "@/lib/results-params";

export const dynamic = "force-dynamic";

export const generateMetadata = () => editMetadata("bestsellers");

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <EditPage edit="bestsellers" searchParams={searchParams} />;
}
