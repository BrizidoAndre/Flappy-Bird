import {computed, reactive, ref} from "vue";
import blue from "@/assets/birds/blue/bluebird-midflap.png";
import green from "@/assets/birds/green/greenbird-midflap.png";
import pink from "@/assets/birds/pink/pinkbird-midflap.png";
import red from "@/assets/birds/red/redbird-midflap.png";
import yellow from "@/assets/birds/yellow/yellowbird-midflap.png";

export const gameInfo = reactive({
    username: '',
    currentBird: -1,
})


export function useBird() {
    const birds = ref([
        blue,
        green,
        pink,
        red,
        yellow,
    ]);
    const birdIndex = ref(0);
    const currentBird = computed(() => birds.value[birdIndex.value])

    function generateNewBird() {
        birdIndex.value++;
        if (birdIndex.value > (birds.value.length - 1)) {
            birdIndex.value = 0;
            let birdsCopy = [...birds.value];
            birdsCopy.sort((a, b) => Math.random() - .5);
            birds.value = [...birdsCopy];
        }
    }

    return {
        currentBird,
        generateNewBird
    }
}

export class Entity {
    constructor(width, height, y, x, moreProps = {},) {
        this.width = width;
        this.height = height;
        this.y = y;
        this.x = x;
        Object.assign(this, moreProps);
    }

    get topHitbox() {
        return this.y
    };

    get bottomHitbox() {
        return this.y + this.height;
    };

    get leftHitBox() {
        return this.x;
    };

    get rightHitBox() {
        return this.x + this.width
    };

    clone() {
        return new Entity(0, 0, 0, 0, this)
    }
}