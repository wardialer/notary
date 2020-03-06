import { shallowMount } from '@vue/test-utils';
import Card from '@/components/Card.vue';

describe('Home.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'File Name:  SHA256 Hash:  Payment address:  amount:  satoshis address:';
    const wrapper = shallowMount(Card, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
