import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import { ApplicationStore } from '@/state';
import crypto from 'crypto';

export default () => {
    const user = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const avatar = useStoreState((state: ApplicationStore) => `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(state.user.data!.email).digest('hex')}?s=512`);
    const rank = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin ? "Administrator" : "User");

    const [ page, setPage ] = useState((!isNaN(defaultPage) && defaultPage > 0) ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState(state => state.user.data!.uuid);
    const rootAdmin = useStoreState(state => state.user.data!.rootAdmin);
    const [ showOnlyAdmin, setShowOnlyAdmin ] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        [ '/api/client/servers', (showOnlyAdmin && rootAdmin), page ],
        () => getServers({ page, type: (showOnlyAdmin && rootAdmin) ? 'admin' : undefined }),
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [ servers?.pagination.currentPage ]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [ page ]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [ error ]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div className="homeBg">
                <h2>Hi {user},</h2>
                <h1>Welcome back!</h1>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#333" fill-opacity="1" d="M0,224L30,218.7C60,213,120,203,180,192C240,181,300,171,360,186.7C420,203,480,245,540,250.7C600,256,660,224,720,229.3C780,235,840,277,900,272C960,267,1020,213,1080,197.3C1140,181,1200,203,1260,218.7C1320,235,1380,245,1410,250.7L1440,256L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path></svg>
            </div>
            <div className="homeServers">
                <h2>Supported games</h2>
                <div className="tarifBox">
                    <div className="tarif">
                        <img src="https://softcatalog.ru/upload/logo/minecraft1-12.png" alt="" />
                        <h2>Minecraft</h2>
                        <p>You can rent a minecraft server on our hosting</p>
                        <a href="#">Order server</a>
                    </div>
                    <div className="tarif">
                        <img src="http://pngimg.com/uploads/gta/gta_PNG37.png" alt="" />
                        <h2>GTA 5</h2>
                        <p>You can rent a GTA server on our hosting</p>
                        <a href="#">Order server</a>
                    </div>
                    <div className="tarif">
                        <img style={{borderRadius:'10px'}} src="https://pbs.twimg.com/profile_images/798188546968481792/-kMkEAbB.jpg" alt="" />
                        <h2>Rust</h2>
                        <p>You can rent a Rust server on our hosting</p>
                        <a href="#">Order server</a>
                    </div>
                    <div className="tarif">
                        <img style={{borderRadius:'10px'}} src="https://steamuserimages-a.akamaihd.net/ugc/767234669276627264/E6B8F02C4023CBC36E4A2AF290AAB3AE17BF2FE0/?imw=512&amp;imh=512&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true" alt="" />
                        <h2>CS:GO</h2>
                        <p>You can rent a CS GO server on our hosting</p>
                        <a href="#">Order server</a>
                    </div>
                </div>
                <h2>Your servers</h2>
                <SearchContainer/>
                {rootAdmin &&
                <div css={tw`mb-2 flex justify-end items-center`} className="switcher">
                    <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                        {showOnlyAdmin ? 'Showing others\' servers' : 'Showing your servers'}
                    </p>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin(s => !s)}
                    />
                </div>
                }
                <div className="clear"></div>
                {!servers ?
                    <Spinner centered size={'large'}/>
                    :
                    <Pagination data={servers} onPageSelect={setPage}>
                        {({ items }) => (
                            items.length > 0 ?
                                items.map((server, index) => (
                                    <ServerRow
                                        key={server.uuid}
                                        server={server}
                                        css={index > 0 ? tw`mt-2` : undefined}
                                    />
                                ))
                                :
                                <p css={tw`text-center text-sm text-neutral-400`}>
                                    {showOnlyAdmin ?
                                        'There are no other servers to display.'
                                        :
                                        'There are no servers associated with your account.'
                                    }
                                </p>
                        )}
                    </Pagination>
                }
            </div>
            <div className="homeAds">
                <div className="userBlock">
                    <img src={avatar} alt="" />
                    <p>{user}</p>
                    <p id={'rank'}>{rank}</p>
                    <a href="/account">account settings</a>
                </div>
                <div id={'ad_1'}>
                    <h1>Enjoy to our Discord</h1>
                    <div className="ds_ava_block">
                        <div className="ds_ava" style={{backgroundImage:`url('https://i0.hippopx.com/photos/746/565/178/people-man-famous-portrait-preview.jpg')`}}></div>
                        <div className="ds_ava" style={{backgroundImage:`url('https://get.pxhere.com/photo/person-girl-woman-hair-photography-portrait-model-youth-fashion-blue-lady-hairstyle-smile-long-hair-face-dress-eye-head-skin-beauty-blond-photo-shoot-brown-hair-portrait-photography-108386.jpg')`}}></div>
                        <div className="ds_ava" style={{backgroundImage:`url('https://i03.fotocdn.net/s109/eee1b2a9e59f28ad/gallery_xl/2431776727.jpg')`}}></div>
                        <div className="ds_ava" style={{backgroundImage:`url('https://w-dog.ru/wallpapers/4/17/489585488816708/bredli-kuper-akter-rubashka-belyj-fon.jpg')`}}></div>
                    </div>
                    <a href={'#'}><button>Enjoy</button></a>
                </div>
            </div>
            <div className="clear"></div>
        </PageContentBlock>
    );
};