import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useParams } from 'react-router-dom'
import { AttachAddon } from '@xterm/addon-attach'
import useTerminalSocketStore from '../../../store/terminalSocketStore';
import useFetchPortLogicStore from '../../../store/fetchportLogicStore';
import { useAuthStore } from '../../../store/authStore';

function BrowserTerminal() {

    const terminalRef = useRef(null);
    const {projectId: projectIdFromURL} = useParams();
    const { setTerminalSocket } = useTerminalSocketStore();
    const {setIsTerminalSocketReady} = useFetchPortLogicStore();

    useEffect(() => {
        const terminal = new Terminal({
            cursorBlink: true,
            theme:{
                background: '#1e1e1e',
                foreground: '#fff',
                cursor: '#fff',
                cursorAccent:"#282a37",
                red: '#f14c4c',
                green: '#23d18b',
                yellow: '#f5f543',
                cyan: '#3b8eea',

            },
            fontFamily: 'Consolas',
            fontSize: 16,
            convertEol : true
        });
        terminal.open(terminalRef.current);
        
        const token = useAuthStore.getState().token;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const wsProtocol = backendUrl.startsWith("https") ? "wss:" : "ws:";
        const wsHost = backendUrl.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${wsHost}/terminal?projectId=${projectIdFromURL}${token ? `&token=${token}` : ""}`;
        const ws = new WebSocket(wsUrl);
        setTerminalSocket(ws);

        ws.onopen = () => {
            //attach fitaddon
            const fitAddon = new FitAddon();
            terminal.loadAddon(fitAddon);
            fitAddon.fit();
            const attachAddon = new AttachAddon(ws);
            terminal.loadAddon(attachAddon);
            setIsTerminalSocketReady(true);
        }

        return () => {
            //socketRef.current.disconnect();
            terminal.dispose();
        }

    }, []);

  return (
    
    <div
    ref={terminalRef}
    style={{
        //setwidth and height
        width : '100%',
        height:'53vh',
    }}
    className='terminal'
    id='terminal-container'
    >
      
    </div>
  )
}

export default BrowserTerminal
