import React, { useEffect, useState } from 'react';
import tw, { TwStyle } from 'twin.macro';
import { faCircle, faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { bytesToHuman, megabytesToHuman } from '@/helpers';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';

interface Stats {
    memory: number;
    cpu: number;
    disk: number;
    uptime: number;
}

function statusToColor (status: string | null, installing: boolean): TwStyle {
    if (installing) {
        status = '';
    }

    switch (status) {
        case 'offline':
            return tw`text-red-500`;
        case 'running':
            return tw`text-green-500`;
        default:
            return tw`text-yellow-500`;
    }
}

const ServerDetailsBlock = () => {
    const [ stats, setStats ] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0 });

    const status = ServerContext.useStoreState(state => state.status.value);
    const connected = ServerContext.useStoreState(state => state.socket.connected);
    const instance = ServerContext.useStoreState(state => state.socket.instance);

    const statsListener = (data: string) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            uptime: stats.uptime || 0,
        });
    };

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.addListener(SocketEvent.STATS, statsListener);
        instance.send(SocketRequest.SEND_STATS);

        return () => {
            instance.removeListener(SocketEvent.STATS, statsListener);
        };
    }, [ instance, connected ]);

    const name = ServerContext.useStoreState(state => state.server.data!.name);
    const isInstalling = ServerContext.useStoreState(state => state.server.data!.isInstalling);
    const isTransferring = ServerContext.useStoreState(state => state.server.data!.isTransferring);
    const limits = ServerContext.useStoreState(state => state.server.data!.limits);
    const primaryAllocation = ServerContext.useStoreState(state => state.server.data!.allocations.filter(alloc => alloc.isDefault).map(
        allocation => (allocation.alias || allocation.ip) + ':' + allocation.port,
    )).toString();

    const diskLimit = limits.disk ? megabytesToHuman(limits.disk) : 'Unlimited';
    const memoryLimit = limits.memory ? megabytesToHuman(limits.memory) : 'Unlimited';
    const cpuLimit = limits.cpu ? limits.cpu + '%' : 'Unlimited';

    return (
        <div className="statusMain">
            <div className='statusBox'>
                <h2>STATUS</h2>
                <p>
                    {!status ? 'Connecting...' : (isInstalling ? 'Installing' : (isTransferring) ? 'Transferring' : status)}<br/>
                    {stats.uptime > 0 &&
                        (<UptimeDuration uptime={stats.uptime / 1000}/>)
                    }
                </p>
                <i className="bi bi-reception-4"></i>
            </div>
            <div className='statusBox'>
                <h2>IP ADDRESS</h2>
                <CopyOnClick text={primaryAllocation}>
                    <p>
                        {primaryAllocation}
                    </p>
                </CopyOnClick>
                <i className="bi bi-pc-display"></i>
            </div>
            <div className='statusBox'>
                <h2>CPU</h2>
                <p>
                    {stats.cpu.toFixed(2)}% / {cpuLimit}
                </p>
                <i className="bi bi-cpu"></i>
            </div>
            <div className='statusBox'>
                <h2>MEMORY</h2>
                <p>
                    {bytesToHuman(stats.memory)} / {memoryLimit}
                </p>
                <i className="bi bi-memory"></i>
            </div>
            <div className='statusBox'>
                <h2>DISK</h2>
                <p>
                    {bytesToHuman(stats.disk)} / {diskLimit}
                </p>
                <i className="bi bi-hdd"></i>
            </div>
        </div>
    );
};

export default ServerDetailsBlock;
