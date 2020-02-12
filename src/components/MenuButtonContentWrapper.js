// libs
import React, { useContext } from 'react';

// contexts
import { LayoutContext } from '../contexts/contexts';
import { ThemeContext } from '../contexts/contexts';

// styles
import '../styles/components/MenuButtonContentWrapper.scss';

export const MenuButtonContentWrapper = (props) => {

    const { vw, vh } = useContext(LayoutContext);
    const { contentPanelColor } = useContext(ThemeContext);

    return (
        <div
            className='menu-button-content'
            style={{
                // display: props.visible === false ? 'hidden' : 'visible',
                // display: !props.parentIsOpen && 'none',
                background: contentPanelColor,
                marginTop: props.marginTop,
                minWidth: props.minWidth,
                maxHeight: 82 * vh,
                maxWidth: 95 * vw,
                padding: 4 * vh,
            }}
        >

            {props.content}

        </div>
    );
}