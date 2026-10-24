import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from '../../app/components/ui/button'
import { Badge } from '../../app/components/ui/badge'
import { Card, CardTitle, CardContent } from '../../app/components/ui/card'

describe('shadcn-vue UI Components', () => {
    it('renders Button with variants and emits click', async () => {
        const wrapper = mount(Button, {
            props: {
                variant: 'destructive',
                size: 'sm'
            },
            slots: {
                default: 'Delete Item'
            }
        })

        expect(wrapper.text()).toBe('Delete Item')
        expect(wrapper.classes()).toContain('bg-destructive')
        expect(wrapper.classes()).toContain('h-8')

        await wrapper.trigger('click')
        expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('renders Badge with correct variant classes', () => {
        const wrapper = mount(Badge, {
            props: {
                variant: 'success'
            },
            slots: {
                default: 'Active Status'
            }
        })

        expect(wrapper.text()).toBe('Active Status')
        expect(wrapper.classes()).toContain('bg-emerald-500/15')
    })

    it('renders Card with header and content slots', () => {
        const wrapper = mount({
            components: { Card, CardTitle, CardContent },
            template: `
        <Card>
          <CardTitle>Overview Card</CardTitle>
          <CardContent>Card body content here</CardContent>
        </Card>
      `
        })

        expect(wrapper.find('h3').text()).toBe('Overview Card')
        expect(wrapper.text()).toContain('Card body content here')
        expect(wrapper.classes()).toContain('bg-card')
    })
})
