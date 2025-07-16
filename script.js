// This function will run when the page loads
window.addEventListener('DOMContentLoaded', async () => {
  // The API endpoint to get the list of areas
  const apiUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?a=list';

  try {
    // Fetch data from the API using async/await
    const response = await fetch(apiUrl);

    // Convert the response to JSON
    const data = await response.json();

    // Log the response to the console
    console.log('Available areas:', data);
  } catch (error) {

    // Log the data to the console so we can see what we get
    console.log(data);
  } catch (error) {
    // log any errors to the console 
    console.error('Error fetching data:', error);