export async function loadTexts() {
    try {
        const response = await fetch('/data/text.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading texts:', error);
        return {
            disclaimer: "It has no financial value. It is the cheapest and fastest meme token for transfers.",
            welcome: "Welcome to MEMEX Rewards!",
            referral_success: "Referral successful!",
            copy_success: "Link copied successfully!",
            share_title: "Join MEMEX Rewards",
            share_text: "Join MEMEX Rewards and earn tokens! Use my referral link:"
        };
    }
}
