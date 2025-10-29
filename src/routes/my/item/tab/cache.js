import s from './cache.module.styl'
import React from 'react'
import t from '~t'
import { API_ENDPOINT_URL } from '~data/constants/app'
import { useSelector } from 'react-redux'
import { isPro } from '~data/selectors/user'

import Header, { Title, Space } from '~co/common/header'
import Button from '~co/common/button'
import Icon from '~co/common/icon'
import Alert from '~co/common/alert'

const invalidStatus = {
    'invalid-origin': 'Origin is unreachable.',
    'invalid-size': 'Page size too large.',
    'invalid-timeout': 'Timeout.'
}

function CacheStatus({ cache, url }) {
    let icon = '', title = ''

    switch(cache) {
        case 'ready':
            icon = 'ready'
            title = t.s('done')
        break

        case 'retry':
        case '':
            icon = 'retry'
            title = 'Not available yet...'
        break

        default:
            icon = 'failed'
            title = <>{t.s('supportOnlyUrls')} <b>{invalidStatus[cache]}</b></>
        break
    }

    return (
        <Header className={s.status} data-status={cache}>
            {icon && <Icon name={'cache_'+icon} className={s.icon} />}
            <Title>
                {title}<br/>
                <small>
                    Permanent copies are made automatically for all bookmarks — you don’t need to do anything. <a href='https://help.raindrop.io/permanent-copy' target='_blank'>Learn more</a>
                </small>
            </Title>
            <Space />

            {cache == 'ready' && (
                <>
                    <Button 
                        href={url}
                        rel='noopener'
                        target='_blank'>
                        <Icon name='open' size='micro' />
                        {t.s('open')}
                    </Button>

                    <Button href={url+'?download'}>
                        <Icon name='document' size='micro' />
                        {t.s('download')}
                    </Button>
                </>
            )}
        </Header>
    )
}

export default function PageMyItemTabCache({ item: { cache, _id } }) {
    const pro = useSelector(state=>isPro(state))
    const url = `${API_ENDPOINT_URL}raindrop/${_id}/cache`

    if (!pro)
        return (
            <Alert variant='warning'>
                {t.s('onlyInPro')}
            </Alert>
        )

    switch(cache) {
        case 'ready':
            return (
                <div className={s.cache}>
                    <CacheStatus cache={cache} url={url} />
                    <iframe 
                        className={s.frame} 
                        plugins='true'
                        src={url} />
                </div>
            )
        
        default:
            return <CacheStatus cache={cache} url={url} />
    }
}