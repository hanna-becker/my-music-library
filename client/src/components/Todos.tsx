import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { createTodo, getTodos, searchSong } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { SearchResult } from '../types/SearchResult'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  searchResults: SearchResult[]
  trackIds: string[]
  newTodoName: string
  searchTerm: string
  loadingTodos: boolean
}


export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    searchResults: [],
    trackIds: ['7yiCeGUDghFoZIBIipI0IZ', '0z21vE4xHXXYSyXkOLDUXF', '1vHXhlhCK4pBHSQYFeLvb7'],
    newTodoName: '',
    searchTerm: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value })
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onSubmitSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const searchResults = await searchSong(this.props.auth.getIdToken(), this.state.searchTerm)
      this.setState({
        searchResults
      })
    } catch {
      alert('Song search failed')
    }
  }

  handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      this.onSubmitSearch(event)
    }
  }

  onSongDelete = async (trackId: string) => {
    // TODO: implement
    // try {
    //   await deleteTodo(this.props.auth.getIdToken(), trackId)
    //   this.setState({
    //     todos: this.state.todos.filter(todo => todo.todoId != trackId)
    //   })
    // } catch {
    //   alert('Todo deletion failed')
    // }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Header as="h1">My Music</Header>
              {this.renderCreateTodoInput()}
              {this.renderTodos()}
            </Grid.Column>
            <Grid.Column width={8}>
              <Header as="h1">Song Search</Header>
              {this.renderSearchInput()}
              {this.renderSearchResults()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider/>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderSearchInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search',
              onClick: this.onSubmitSearch
            }}
            fluid
            actionPosition="left"
            placeholder="I'm singing in the rain..."
            onChange={this.handleSearchInputChange}
            onKeyDown={this.handleKeyDown}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider/>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderSongsList()
  }

  renderSearchResults() {
    if (this.state.loadingTodos) {
      // TODO: loading state
      return this.renderLoading()
    }

    return this.renderSearchResultsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderSongsList() {
    return (
      <Grid padded>
        {this.state.trackIds.map((trackId, pos) => {
          const songPath = `https://open.spotify.com/embed/track/${trackId}`
          return (
            <Grid.Row key={trackId}>
              <Grid.Column width={14} verticalAlign="middle">
                <iframe src={songPath} width="300" height="80" frameBorder="0" allow="encrypted-media"/>
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button icon color="red" onClick={() => this.onSongDelete(trackId)}>
                  <Icon name="delete"/>
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider/>
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  renderSearchResultsList() {
    return (
      <Grid padded>
        {this.state.searchResults.map((searchResult, pos) => {
          return (
            <Grid.Row key={searchResult.id}>
              <Grid.Column width={3} verticalAlign="middle">
                {searchResult.imageUrl && (<Image src={searchResult.imageUrl} size="small" wrapped/>)}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {searchResult.artists}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {searchResult.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" floated="right">
                {searchResult.duration}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => {
                  }}
                >
                  <Icon name="add"/>
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider/>
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
