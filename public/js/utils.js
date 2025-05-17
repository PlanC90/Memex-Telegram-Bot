function downloadAllJson() {
  window.location.href = '/download-all-json';
}

export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function showMessage(message) {
    alert(message);
}

export async function saveToFile(fileName, data) {
  try {
    const response = await fetch(`/save/${fileName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Successfully saved ${fileName}`);
    return result;
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
    // Retry once on failure
    try {
      const retryResponse = await fetch(`/save/${fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (retryResponse.ok) {
        return await retryResponse.json();
      }
    } catch (retryError) {
      console.error(`Retry failed for ${fileName}:`, retryError);
    }
    throw error;
  }
}

export function isAndroid() {
    return /android/i.test(navigator.userAgent);
}

export function isTwitterInstalled() {
    return new Promise(resolve => {
        if (isAndroid()) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            const timeoutId = setTimeout(() => {
                document.body.removeChild(iframe);
                resolve(false);
            }, 2000);

            iframe.onload = () => {
                clearTimeout(timeoutId);
                document.body.removeChild(iframe);
                resolve(true);
            };

            iframe.src = 'twitter://';
        } else {
            resolve(false);
        }
    });
}
