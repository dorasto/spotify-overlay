import CustomOverlayEditor from "@/components/custom";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
        const { token } = await searchParams;
    return <CustomOverlayEditor firstLoadToken={token as string}/>;
}
