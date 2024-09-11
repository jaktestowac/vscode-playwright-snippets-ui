//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const buttons = document.querySelectorAll(".nav-list__link");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const attributeKey = button.getAttribute("key");
      vscode.postMessage({ type: "invokeSnippet", key: attributeKey });

      // Disable the button and show a loading indicator
      // for a second to let the user know the command is running
      // @ts-ignore
      button.disabled = true;
      button.classList.add("loading");
      setTimeout(() => {
        // @ts-ignore
        button.disabled = false;
        button.classList.remove("loading");
      }, 1000);
    });
  }
  const searchInput = document.getElementById("searchInput");

  searchInput?.addEventListener("keyup", () => {
    // @ts-ignore
    const searchText = searchInput.value;
    const allItems = Array.from(document.querySelectorAll(".nav-list__link"));

    const searchResults = allItems.filter((item) => {
      return item.getAttribute("searchables")?.toLowerCase().includes(searchText);
    });

    for (const result of searchResults) {
      result.classList.add("search-result");
      result.classList.remove("not-search-result");
      result?.parentElement?.classList.remove("not-search-result");
    }

    const notSearchResults = allItems.filter((item) => {
      return !item.getAttribute("searchables")?.toLowerCase().includes(searchText);
    });
    
    for (const item of notSearchResults) {
      item.classList.remove("search-result");
      item.classList.add("not-search-result");
      item?.parentElement?.classList.add("not-search-result");
    }

    const allSearchResults = document.getElementsByClassName("search-result");
    if (allSearchResults.length === 0) {
      let noResultsHeader = document.getElementById("noResultsHeader");
      if (!noResultsHeader) {
        noResultsHeader = document.createElement("h4");
        noResultsHeader.textContent = "No search results found.";
        noResultsHeader.setAttribute("id", "noResultsHeader");
        searchInput.parentElement?.appendChild(noResultsHeader);
      }
    } else {
      const noResultsHeader = document.getElementById("noResultsHeader");
      if (noResultsHeader) {
        noResultsHeader.remove();
      }
    }

    hideEmptySections();
  });

  function hideEmptySections() {
    const titleElement = document.getElementsByClassName("nav-list__title");
    for (let i = 0; i < titleElement.length; i++) {
      const nextElement = titleElement[i].nextElementSibling;
      const visibleSearchResult = nextElement?.getElementsByClassName("search-result");
      if (visibleSearchResult?.length === 0) {
        titleElement[i].classList.add("not-search-result");
      } else {
        titleElement[i].classList.remove("not-search-result");
      }
    }
  }
})();
