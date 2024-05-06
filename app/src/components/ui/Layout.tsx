import { ReactNode } from "react";

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    // const router = useRouter();
    // const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [isLoggedIn, setIsLoggedIn] = useState(false);

    // const changeLocale = () => {
    //     const newLocale = router.locale === "en" ? "kr" : "en";
    //     router.push(router.pathname, router.asPath, { locale: newLocale });
    // };

    // useEffect(() => {
    //     const checkUser = async () => {
    //         const { data, error } = await supabase.auth.getUser();
    //         setIsLoggedIn(!!data.user);
    //     };

    //     checkUser();

    //     const { data: authListener } = supabase.auth.onAuthStateChange(
    //         async (_event, session) => {
    //             setIsLoggedIn(!!session?.user);
    //         }
    //     );

    //     return () => {
    //         authListener.subscription.unsubscribe();
    //     };
    // }, []);

    return (
        <>
            <div className="flex flex-col min-h-screen">
                {/* Nav for Small Screen */}
                <nav className="fixed top-0 left-0 w-full h-16 flex items-center px-4 z-[10] text-xs">
                    <div className="flex justify-start">
                        <img
                            src={`${process.env.PUBLIC_URL}/ic_logo@4x.png`}
                            alt="Backstage Studio Logo"
                            width={92}
                            height={44}
                            className="object-contain hover:cursor-pointer"
                            onClick={() =>
                                window.open(
                                    "https://backstage-ai.com/",
                                    "_blank"
                                )
                            }
                        />
                    </div>
                </nav>
                <main className="flex-grow overflow-auto">{children}</main>
            </div>
        </>
    );
};

export default Layout;
