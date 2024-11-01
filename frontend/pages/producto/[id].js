import React, { useEffect, useState } from "react";
import Detail from "../../components/Detail";
import { useRouter } from "next/router";
import useStore from "../../store/store";
import { BounceLoader } from 'react-spinners';

export default function DetailPage() {
    const { fetchProductById, product } = useStore();
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (id) {
                await fetchProductById(id);
            }
            setLoading(false);
        };
        fetchData();
    }, [id, fetchProductById]);
    if (loading) {
        return (
            <div className="flex items-center justify-center mt-[5%]">
                <BounceLoader color="#BE1A1D" />
            </div>
        );
    }

    if (!product) return <div>No se encontró el producto.</div>;

    return (
        <div>
            <Detail product={product} />
        </div>
    )
}
