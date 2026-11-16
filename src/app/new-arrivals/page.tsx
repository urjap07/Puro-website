import EditPage, { editMetadata } from "@/components/commerce/EditPage";
import type { RawParams } from "@/lib/results-params";

export const dynamic = "force-dynamic";

export const generateMetadata = () => editMetadata("new-arrivals");

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <EditPage edit="new-arrivals" searchParams={searchParams} />;
}
