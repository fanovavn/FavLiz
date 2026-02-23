import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function Index() {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) return <LoadingSpinner text="FavLiz" />;
    if (isAuthenticated) return <Redirect href="/(tabs)" />;
    return <Redirect href="/login" />;
}
