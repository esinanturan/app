import React, { useState, useCallback } from 'react'
import t from '~t'
import { Text } from '~co/common/form'

export default function BookmarkEditFormTitle({ autoFocus, item: { title, excerpt }, onChange, onCommit }) {
    const [maxRows, setMaxRows] = useState({
        title: 3,
        excerpt: 1
    })

    const onChangeField = useCallback((e) => {
        onChange({ [e.target.getAttribute('name')]: e.target.value })
    }, [onChange])

    const onFocusField = useCallback((e) => {
        const fieldName = e.target.getAttribute('name')
        setMaxRows(prev => ({
            ...prev,
            [fieldName]: undefined
        }))
    }, [setMaxRows])

    return (
        <div>
            <Text 
                variant='less'
                font='title'
                autoSize={true}
                type='text'
                required={true}
                autoComplete='off'
                spellCheck='false'
                autoFocus={autoFocus === 'title'}
                name='title'
                placeholder={t.s('title')}
                value={title}
                maxRows={maxRows.title}
                onChange={onChangeField}
                onFocus={onFocusField}
                onBlur={onCommit} />

            <Text 
                variant='less'
                font='secondary'
                autoSize={true}
                type='text'
                autoComplete='off'
                spellCheck='false'
                autoFocus={autoFocus === 'excerpt'}
                name='excerpt'
                maxLength='10000'
                multiline={true}
                value={excerpt}
                placeholder={`${t.s('add')} ${t.s('description').toLowerCase()}`}
                maxRows={maxRows.excerpt}
                onChange={onChangeField}
                onFocus={onFocusField}
                onBlur={onCommit} />
        </div>
    )
}