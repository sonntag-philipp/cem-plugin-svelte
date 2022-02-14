<svelte:options tag="my-app" />

<script lang="ts">
    /**
     * How old are you?
     */
    export let age: number = 1337;

    /**
     * What is your name?
     */
    export const name: string = "Peter Maffay";
</script>

<main>
    <h1>Hello { name }!</h1>
    <p>You are { age } years old.</p>
</main>

<style>
    main {
        font-family: sans-serif;
    }
</style>