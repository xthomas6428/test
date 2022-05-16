import React from 'react';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import Button from '@/components/elements/Button';
import StopOrKillButton from '@/components/server/StopOrKillButton';
import { PowerAction } from '@/components/server/ServerConsole';
import { ServerContext } from '@/state/server';

const PowerControls = () => {
    const status = ServerContext.useStoreState(state => state.status.value);
    const instance = ServerContext.useStoreState(state => state.socket.instance);

    const sendPowerCommand = (command: PowerAction) => {
        instance && instance.send('set state', command);
    };

    return (
        <div className='controlBtns'>
            <Can action={'control.start'}>
                <Button
                    size={'xsmall'}
                    color={'green'}
                    isSecondary
                    className='first'
                    disabled={status !== 'offline'}
                    onClick={e => {
                        e.preventDefault();
                        sendPowerCommand('start');
                    }}
                >
                    <i className="bi bi-play-circle"></i>
                </Button>
            </Can>
            <Can action={'control.restart'}>
                <Button
                    size={'xsmall'}
                    isSecondary
                    className='second'
                    disabled={!status}
                    onClick={e => {
                        e.preventDefault();
                        sendPowerCommand('restart');
                    }}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
            </Can>
            <Can action={'control.stop'}>
                <StopOrKillButton onPress={action => sendPowerCommand(action)}/>
            </Can>
        </div>
    );
};

export default PowerControls;
